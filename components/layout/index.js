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
        <div>
            { children }
        </div>
    );
}

export {
    Container,
    LeftSide,
    Content
}
