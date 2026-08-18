import { PageTransitionWrapper } from '@/components/page-transition';
import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';

export default function AuthLayout({
    title = '',
    description = '',
    children,
}: {
    title?: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <AuthLayoutTemplate title={title} description={description}>
            <PageTransitionWrapper>
                {children}
            </PageTransitionWrapper>
        </AuthLayoutTemplate>
    );
}
