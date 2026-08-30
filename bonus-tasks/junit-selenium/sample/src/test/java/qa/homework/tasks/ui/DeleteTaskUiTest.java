package qa.homework.tasks.ui;

import feign.FeignException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.test.context.ActiveProfiles;
import qa.homework.tasks.api.CreateTaskRequest;
import qa.homework.tasks.client.TaskApiClient;
import qa.homework.tasks.domain.Task;
import qa.homework.tasks.domain.TaskStore;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Delete Task in the web UI. The backend is the in-memory mock API; Feign is the
 * typed client used for seed and verification.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@EnableFeignClients(clients = TaskApiClient.class)
@ActiveProfiles("test")
class DeleteTaskUiTest {

    @Autowired
    private TaskApiClient tasks;

    @Autowired
    private TaskStore store;

    private WebDriver driver;

    @BeforeEach
    void setUp() {
        store.reset();
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless=new", "--disable-gpu", "--window-size=1280,800");
        driver = new ChromeDriver(options);
    }

    @AfterEach
    void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    void deletingATaskFromTheListRemovesIt() {
        Task created = tasks.create(new CreateTaskRequest("Delete me", "", "todo"));

        TaskListPage page = new TaskListPage(driver, "http://127.0.0.1:18080").open();
        page.deleteTask(created.id());

        assertThat(page.hasTask(created.id())).isFalse();
        assertThatThrownBy(() -> tasks.get(created.id())).isInstanceOf(FeignException.NotFound.class);
    }

    @Test
    void unknownTaskIsNotShownOnTheList() {
        assertThatThrownBy(() -> tasks.get("00000000-0000-0000-0000-000000000000"))
                .isInstanceOf(FeignException.NotFound.class);

        TaskListPage page = new TaskListPage(driver, "http://127.0.0.1:18080").open();

        assertThat(page.hasTask("00000000-0000-0000-0000-000000000000")).isFalse();
    }
}
