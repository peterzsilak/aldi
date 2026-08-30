package qa.homework.tasks.api;

import java.util.List;

public record ApiErrorBody(String error, List<String> details) {}
