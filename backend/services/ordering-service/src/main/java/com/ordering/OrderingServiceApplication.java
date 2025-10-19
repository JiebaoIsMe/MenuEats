package com.ordering;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
public class OrderingServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(OrderingServiceApplication.class, args);
	}

}
