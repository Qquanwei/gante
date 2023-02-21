import React from 'react';

function DraggleBar() {
  return (
    <div className="h-full w-2.5 flex items-center justify-center bg-gray-300 rounded">
      <div className="rounded h-full w-2/5 h-3/5 bg-white hover:outline hover:outline-sky-500"></div>
    </div>
  );
}

export default React.memo(DraggleBar);
