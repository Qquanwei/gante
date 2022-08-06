import useGante from './useGante';
import TodoItem from './todoitem';

function TodoList() {
  const { list } = useGante();
  return (
    <div>
      {
        list.map((item) => {
          return (
            <TodoItem item={item} key={item.id}/>
          )
        })
      }
    </div>
  );
}

export default TodoList;
