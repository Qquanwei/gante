import classNames from 'classnames';

function Container({ children, className }) {
    return (
        <div>
            {children }
        </div>
    );
}

function LeftSide({ children }) {
    return (
        <div>
            { children }
        </div>
    );
}

function Content({ children }) {
    return (
        <div className="w-[100vw] h-[100vh] overflow-auto relative" data-role="scroll-container">
            { children }
        </div>
    );
}

export {
    Container,
    LeftSide,
    Content
}
