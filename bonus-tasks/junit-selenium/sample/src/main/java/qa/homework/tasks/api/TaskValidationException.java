package qa.homework.tasks.api;

import java.util.List;

public class TaskValidationException extends RuntimeException {

    private final List<String> details;

    public TaskValidationException(List<String> details) {
        super("Bad Request");
        this.details = List.copyOf(details);
    }

    public List<String> details() {
        return details;
    }
}
