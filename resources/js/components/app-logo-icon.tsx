import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect width="40" height="40" rx="10" fill="#d88f6d" />
            <path
                d="M13 10H22.5C25.5376 10 28 12.4624 28 15.5C28 18.5376 25.5376 21 22.5 21H17.5V30H13V10Z"
                fill="white"
            />
            <path
                d="M17.5 14H22.5C23.3284 14 24 14.6716 24 15.5C24 16.3284 23.3284 17 22.5 17H17.5V14Z"
                fill="#d88f6d"
            />
            <circle cx="28" cy="27" r="2.5" fill="white" fillOpacity="0.9" />
        </svg>
    );
}
