package com.toolshare.booking;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class BookingServiceApplication {

    private static final Logger log = LoggerFactory.getLogger(BookingServiceApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(BookingServiceApplication.class, args);
        log.info("ToolShare Booking Service started on port 8084");
    }
}

