import parseX from "../parsex";

describe('parsex', () => {
    it ('case1', () => {
        const config = parseX('drag pin/drop');
        expect(config).toHaveLength(2);
    })

    it ('case2', () => {
        const config = parseX('drag pin/drag-over');
        expect(config).toHaveLength(2);
        expect(config[1]).toMatchObject({
            modify: 'over',
            eventName: 'drag',
            groupName: 'pin',
            className: []
        });
    })
})