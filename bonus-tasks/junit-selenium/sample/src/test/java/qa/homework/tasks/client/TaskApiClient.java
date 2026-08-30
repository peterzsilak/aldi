package qa.homework.tasks.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import qa.homework.tasks.api.CreateTaskRequest;
import qa.homework.tasks.domain.Task;

/**
 * Typed client against the in-process mock API (same contract as task-3-api-testing).
 * HTTP 404 is raised as {@code FeignException.NotFound}.
 */
@FeignClient(name = "task-api", url = "${task.api.base-url}")
public interface TaskApiClient {

    @PostMapping(path = "/tasks", consumes = MediaType.APPLICATION_JSON_VALUE)
    Task create(@RequestBody CreateTaskRequest request);

    @GetMapping("/tasks/{id}")
    Task get(@PathVariable("id") String id);

    @DeleteMapping("/tasks/{id}")
    void delete(@PathVariable("id") String id);
}
