package qa.homework.tasks.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import qa.homework.tasks.domain.Task;
import qa.homework.tasks.domain.TaskStatus;
import qa.homework.tasks.domain.TaskStore;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

/**
 * Mock REST API with the same contract as Task 3 ({@code POST/GET/DELETE /tasks}).
 */
@RestController
@RequestMapping("/tasks")
public class TaskController {

    private final TaskStore store;

    public TaskController(TaskStore store) {
        this.store = store;
    }

    @GetMapping
    public List<Task> list() {
        return store.list();
    }

    @GetMapping("/{id}")
    public Task get(@PathVariable String id) {
        return store.find(id).orElseThrow(() -> new TaskNotFoundException(id));
    }

    @PostMapping
    public ResponseEntity<Task> create(@RequestBody(required = false) CreateTaskRequest request) {
        Task created = store.create(validatedTitle(request), descriptionOf(request), statusOf(request));
        return ResponseEntity.created(URI.create("/tasks/" + created.id())).body(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (!store.delete(id)) {
            throw new TaskNotFoundException(id);
        }
        return ResponseEntity.noContent().build();
    }

    private static String validatedTitle(CreateTaskRequest request) {
        List<String> details = new ArrayList<>();
        String title = request == null ? null : request.title();

        if (title == null || title.trim().isEmpty()) {
            details.add("title is required and must be a non-empty string");
        }
        if (request != null && request.status() != null && !TaskStatus.isKnown(request.status())) {
            details.add("status must be one of: todo, in_progress, done");
        }
        if (!details.isEmpty()) {
            throw new TaskValidationException(details);
        }
        return title.trim();
    }

    private static String descriptionOf(CreateTaskRequest request) {
        return request.description() == null ? "" : request.description();
    }

    private static TaskStatus statusOf(CreateTaskRequest request) {
        return request.status() == null ? TaskStatus.todo : TaskStatus.valueOf(request.status());
    }
}
