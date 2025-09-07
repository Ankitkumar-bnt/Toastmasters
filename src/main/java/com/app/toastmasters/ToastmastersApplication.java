package com.app.toastmasters;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.app.toastmasters")
public class ToastmastersApplication {

	public static void main(String[] args) {
		SpringApplication.run(ToastmastersApplication.class, args);
	}

}
