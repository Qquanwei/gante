import StateManage from './state';
import parseX from './parsex';


function EventSystem() {
  let dropTree = {};

  function domNotify(mutationList) {
    mutationList.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) {
            return;
          }
          const allDataNodes = node.querySelectorAll('[data-x]');
          requestAnimationFrame(() => {
            allDataNodes.forEach((node) => {
              const configs = parseX(node.dataset.x);
              configs.forEach(config => {
                if (config.groupName) {
                  node.setAttribute(`data-inner-${config.groupName}-${config.eventName}`, true);
                } else {
                  node.setAttribute(`data-inner-${config.eventName}`, true);
                }
              });
            });
          });
        });
      }
    });
  }

  function bindDragEvent(container) {
    let dragEndCallbacks = [];

    container.addEventListener('dragstart', (e) => {

    });

    container.addEventListener('dragend', (e) => {
      if (dragEndCallbacks.length) {
        dragEndCallbacks.forEach(c => {
          c();
        });
        dragEndCallbacks = [];
      }
    });
  }

  function attachDOM(container) {
    const observer = new MutationObserver(domNotify);
    observer.observe(container, {
      childList: true,
      subtree: true,
    });

    const state = new StateManage(container);

    return () => {
      observer.disconnect();
      state.unmount();
    };
  }

  return {
    attachDOM
  };
}
export default EventSystem;
