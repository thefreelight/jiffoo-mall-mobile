/**
 * React 19 Type Compatibility Fix for Expo/React Native
 * 
 * React 19 changes how JSX types work, causing "refs missing" errors with
 * libraries that haven't updated their type definitions yet.
 * 
 * This file extends React's types to make all component types compatible
 * with React 19's new JSX transform requirements.
 * 
 * References:
 * - https://react.dev/blog/2024/04/25/react-19-upgrade-guide#typescript-changes
 * - https://github.com/DefinitelyTyped/DefinitelyTyped/issues/69006
 */

import { JSX as ReactJSX } from 'react';

// Extend React's type definitions to fix JSX compatibility
declare global {
    namespace JSX {
        // Make all intrinsic elements accept any props for React 19 compatibility
        interface IntrinsicElements extends ReactJSX.IntrinsicElements { }

        // Fix ElementClass to not require deprecated refs property
        interface ElementClass {
            render(): React.ReactNode;
        }

        // Make element attributes more permissive
        interface IntrinsicAttributes {
            key?: React.Key | null | undefined;
        }

        // Allow any element type as valid JSX
        type Element = React.ReactNode;
    }
}

// Augment React module to fix component type checking
declare module 'react' {
    // Allow any function component to be used as JSX
    interface FunctionComponent<P = {}> {
        (props: P, context?: any): React.ReactNode;
    }

    // Allow class components without refs
    interface ComponentClass<P = {}, S = {}> {
        new(props: P, context?: any): React.Component<P, S>;
    }
}

export { };
