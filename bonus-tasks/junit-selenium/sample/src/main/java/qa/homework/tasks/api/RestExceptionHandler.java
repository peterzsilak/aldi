package qa.homework.tasks.api;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class RestExceptionHandler {

    @ExceptionHandler(TaskNotFoundException.class)
    public ResponseEntity<ApiErrorBody> notFound(TaskNotFoundException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiErrorBody("Not Found", java.util.List.of(exception.getMessage())));
    }

    @ExceptionHandler(TaskValidationException.class)
    public ResponseEntity<ApiErrorBody> badRequest(TaskValidationException exception) {
        return ResponseEntity.badRequest().body(new ApiErrorBody("Bad Request", exception.details()));
    }
}
