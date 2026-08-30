package qa.homework.tasks.domain;

import java.util.Arrays;

public enum TaskStatus {
    todo,
    in_progress,
    done;

    public static boolean isKnown(String value) {
        return Arrays.stream(values()).anyMatch(status -> status.name().equals(value));
    }
}
