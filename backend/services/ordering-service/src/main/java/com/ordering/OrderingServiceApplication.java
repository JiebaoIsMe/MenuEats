package com.ordering;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class OrderingServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(OrderingServiceApplication.class, args);
	}

}
