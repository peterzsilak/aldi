package qa.homework.tasks.api;

public class TaskNotFoundException extends RuntimeException {

    public TaskNotFoundException(String id) {
        super("No task with id " + id);
    }
}
