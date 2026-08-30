package qa.homework.tasks.domain;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * In-memory stand-in for the task service — the same idea as {@code task-store.ts} in Task 3.
 */
@Component
public class TaskStore {

    private final Map<String, Task> tasks = new LinkedHashMap<>();
    private long lastTimestampMillis;

    public synchronized void reset() {
        tasks.clear();
        lastTimestampMillis = 0;
    }

    public synchronized List<Task> list() {
        return new ArrayList<>(tasks.values());
    }

    public synchronized Optional<Task> find(String id) {
        return Optional.ofNullable(tasks.get(id));
    }

    public synchronized Task create(String title, String description, TaskStatus status) {
        String now = nextTimestamp();
        Task task = new Task(UUID.randomUUID().toString(), title, description, status, now, now);
        tasks.put(task.id(), task);
        return task;
    }

    public synchronized boolean delete(String id) {
        return tasks.remove(id) != null;
    }

    private String nextTimestamp() {
        long now = Math.max(System.currentTimeMillis(), lastTimestampMillis + 1);
        lastTimestampMillis = now;
        return Instant.ofEpochMilli(now).toString();
    }
}
