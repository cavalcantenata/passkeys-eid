import { UnauthenticatedTemplate } from '@azure/msal-react';
import { NavigationBar } from './NavigationBar.jsx';

export const PageLayout = (props) => {
    return (
        <>
            <NavigationBar />
            <br />
            <UnauthenticatedTemplate>
                <div className="man-welcome">
                    <h3>Welcome to MAN MyPortal</h3>
                    <p>Sign in to manage your account and security credentials.</p>
                </div>
            </UnauthenticatedTemplate>
            {props.children}
            <br />
        </>
    );
}
