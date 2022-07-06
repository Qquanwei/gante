import useGante from './useGante';
import TodoItem from './todoitem';

function TodoList() {
    const { list, TODOLIST_WIDTH } = useGante();
    return (
        <div style={{ width: TODOLIST_WIDTH, position: 'absolute', top: '0' }}>
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
