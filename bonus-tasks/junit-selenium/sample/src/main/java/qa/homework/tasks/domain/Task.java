package qa.homework.tasks.domain;

public record Task(
        String id,
        String title,
        String description,
        TaskStatus status,
        String createdAt,
        String updatedAt
) {}
