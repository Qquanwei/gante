import StateMachine, { DragAndDropState, NormalState, State } from '../state';

describe('event-system state', () => {
    it ('should be a function', () => {
        expect(StateMachine).toBeInstanceOf(Function);
    })
});

describe('event-system NormalState', () => {
    it ('should be a function', () => {
        expect(NormalState).toBeInstanceOf(Function);
    });

    it ('should be a state', () => {
        expect(new NormalState).toBeInstanceOf(State);
    });

    it ('should switch to draganddropstate', () => {
        const normal = new NormalState();
        normal.machine = {
            switchState: jest.fn()
        };
        const event = {};

        event.target = document;
        event.target.dataset = {};
        event.dataTransfer = {};
        event.dataTransfer.setData = jest.fn();
        event.dataTransfer.setDragImage = jest.fn();
        normal.onDragStart(event);
        expect(normal.machine.switchState).toHaveBeenCalled();
        expect(normal.machine.switchState.mock.calls[0][0]).toBeInstanceOf(DragAndDropState);
    })
})