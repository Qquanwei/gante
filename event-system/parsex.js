export default function parseX(dataX) {
    return dataX.split(' ').map(xStr => {
        let className, last, groupName, modify = '', eventName;
        [groupName, last] = xStr.split('/');
        if (!last) {
          groupName = null;
          last = xStr;
        }
      
        [last, ...className] = last.split('.');
        [eventName, modify] = last.split('-');      
      
        return {
          className,
          groupName,
          modify,
          eventName
        };
    });
}

export function isEventMatch(eventName, sourceConfigs, targetConfigs) {
    return [].concat(targetConfigs).filter((config) => {
        return sourceConfigs.some(thisConfig => {
            return (thisConfig.groupName === config.groupName) && (
                config.eventName === eventName
            );
        });
    })[0];
}