package qa.homework.tasks.web;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.server.ResponseStatusException;
import qa.homework.tasks.domain.Task;
import qa.homework.tasks.domain.TaskStore;

@Controller
public class TaskWebController {

    private final TaskStore store;

    public TaskWebController(TaskStore store) {
        this.store = store;
    }

    @GetMapping("/")
    public String list(Model model) {
        model.addAttribute("tasks", store.list());
        return "tasks";
    }

    @GetMapping("/confirm-delete/{id}")
    public String confirmDelete(@PathVariable String id, Model model) {
        Task task = store.find(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        model.addAttribute("task", task);
        return "confirm-delete";
    }

    @PostMapping("/delete/{id}")
    public String delete(@PathVariable String id) {
        if (!store.delete(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        return "redirect:/";
    }
}
