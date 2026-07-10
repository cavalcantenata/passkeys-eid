import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react';
import { Navbar, Button } from 'react-bootstrap';
import { loginRequest } from '../authConfig';
import { clearAppTokenCache } from '../utils/tokenUtils';

export const NavigationBar = () => {
    const { instance } = useMsal();

    const handleLoginRedirect = async () => {
        try {
            await instance.loginRedirect({
                ...loginRequest,
                prompt: 'login',
            });
        } catch (error) {
            console.error('Login redirect failed:', error);
        }
    };

    const handleLogoutRedirect = async () => {
        try {
            const accounts = instance.getAllAccounts();
            clearAppTokenCache(instance);

            if (accounts.length === 0) {
                await instance.clearCache();
                window.location.href = '/';
                return;
            }
            
            await instance.logoutRedirect({
                account: accounts[0],
            });
        } catch (error) {
            console.error('Logout redirect failed:', error);
        }
    };

    return (
        <>
            <Navbar className="navbarStyle man-navbar">
                <a className="navbar-brand man-brand" href="/">
                    MAN MyPortal
                </a>
                <AuthenticatedTemplate>
                    <div className="collapse navbar-collapse justify-content-end">
                        <Button className="man-btn-outline" onClick={handleLogoutRedirect}>
                            Sign out
                        </Button>
                    </div>
                </AuthenticatedTemplate>
                <UnauthenticatedTemplate>
                    <div className="collapse navbar-collapse justify-content-end">
                        <Button className="man-btn" onClick={handleLoginRedirect}>Sign in</Button>
                    </div>
                </UnauthenticatedTemplate>
            </Navbar>
        </>
    );
};
