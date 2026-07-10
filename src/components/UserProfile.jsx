import { useState, useEffect } from 'react';
import { Card, Spinner, Alert, Button, Form, Modal } from 'react-bootstrap';
import { FaUser, FaEdit } from 'react-icons/fa';
import { graphGet, makeGraphRequest } from '../services/GraphApiClient';

const EXTENSION_APP_ID = 'fe28c58b-dc2f-4b4e-93a5-ea6ace7a2a7e';
const EXTENSION_PREFIX = `extension_${EXTENSION_APP_ID.replace(/-/g, '')}_`;

export const UserProfile = ({ userId, appToken }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editForm, setEditForm] = useState({ displayName: '', mobilePhone: '' });
    const [saveError, setSaveError] = useState(null);

    const fetchProfile = async () => {
        if (!userId || !appToken) return;
        try {
            const response = await graphGet(`/users/${userId}`, appToken);
            const data = await response.json();
            setProfile(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [userId, appToken]);

    const handleEdit = () => {
        setEditForm({
            displayName: profile.displayName || '',
            mobilePhone: profile.mobilePhone || '',
        });
        setSaveError(null);
        setEditing(true);
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveError(null);
        try {
            await makeGraphRequest(`/users/${userId}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    displayName: editForm.displayName,
                    mobilePhone: editForm.mobilePhone || null,
                }),
            }, appToken);
            setEditing(false);
            await fetchProfile();
        } catch (err) {
            setSaveError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Card className="man-card mb-4">
                <Card.Body className="d-flex justify-content-center py-4">
                    <Spinner animation="border" size="sm" />
                </Card.Body>
            </Card>
        );
    }

    if (error) {
        return (
            <Alert variant="warning" className="mb-4">
                <small>Could not load profile: {error}</small>
            </Alert>
        );
    }

    if (!profile) return null;

    const standardFields = [
        { label: 'Display Name', value: profile.displayName },
        { label: 'Email', value: profile.mail || profile.userPrincipalName },
        { label: 'Phone Number', value: profile.mobilePhone },
        { label: 'Job Title', value: profile.jobTitle },
        { label: 'Department', value: profile.department },
        { label: 'Company', value: profile.companyName },
        { label: 'City', value: profile.city },
        { label: 'Country', value: profile.country },
        { label: 'Employee ID', value: profile.employeeId },
    ].filter(f => f.value);

    const extensionAttributes = Object.entries(profile)
        .filter(([key]) => key.startsWith(EXTENSION_PREFIX) || key.startsWith('extension_'))
        .map(([key, value]) => ({
            label: key.replace(EXTENSION_PREFIX, '').replace(/^extension_[a-f0-9]+_/, ''),
            value: typeof value === 'object' ? JSON.stringify(value) : String(value),
        }))
        .filter(f => f.value && f.value !== 'null');

    return (
        <>
            <Card className="man-card mb-4">
                <Card.Header className="man-card-header d-flex justify-content-between align-items-center">
                    <span><FaUser className="me-2" />My Profile</span>
                    <Button size="sm" className="man-btn-edit" onClick={handleEdit}>
                        <FaEdit className="me-1" /> Edit information
                    </Button>
                </Card.Header>
                <Card.Body>
                    <div className="profile-grid">
                        {standardFields.map(({ label, value }) => (
                            <div key={label} className="profile-field">
                                <span className="profile-label">{label}</span>
                                <span className="profile-value">{value}</span>
                            </div>
                        ))}
                    </div>

                    {extensionAttributes.length > 0 && (
                        <>
                            <hr />
                            <h6 className="man-section-title">Extension Attributes</h6>
                            <div className="profile-grid">
                                {extensionAttributes.map(({ label, value }) => (
                                    <div key={label} className="profile-field">
                                        <span className="profile-label">{label}</span>
                                        <span className="profile-value">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </Card.Body>
            </Card>

            <Modal show={editing} onHide={() => setEditing(false)} centered>
                <Modal.Header closeButton className="man-card-header">
                    <Modal.Title>Edit Information</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {saveError && <Alert variant="danger" className="mb-3"><small>{saveError}</small></Alert>}
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label className="profile-label">Display Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={editForm.displayName}
                                onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="profile-label">Phone Number</Form.Label>
                            <Form.Control
                                type="tel"
                                value={editForm.mobilePhone}
                                onChange={(e) => setEditForm(prev => ({ ...prev, mobilePhone: e.target.value }))}
                                placeholder="+1234567890"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
                    <Button className="man-btn" onClick={handleSave} disabled={saving || !editForm.displayName.trim()}>
                        {saving ? <Spinner animation="border" size="sm" /> : 'Save'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default UserProfile;
