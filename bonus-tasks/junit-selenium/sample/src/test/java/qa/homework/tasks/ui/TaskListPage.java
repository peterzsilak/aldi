package qa.homework.tasks.ui;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

final class TaskListPage {

    private final WebDriver driver;
    private final WebDriverWait wait;
    private final String baseUrl;

    TaskListPage(WebDriver driver, String baseUrl) {
        this.driver = driver;
        this.baseUrl = baseUrl;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(5));
    }

    TaskListPage open() {
        driver.get(baseUrl + "/");
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid=task-list]")));
        return this;
    }

    void deleteTask(String id) {
        driver.findElement(By.cssSelector("[data-testid=delete-task-" + id + "]")).click();
        wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("[data-testid=confirm-delete]"))).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid=task-list]")));
    }

    boolean hasTask(String id) {
        return !driver.findElements(By.cssSelector("[data-testid=task-row-" + id + "]")).isEmpty();
    }
}
