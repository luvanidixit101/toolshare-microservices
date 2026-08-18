package com.toolshare.tool;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class ToolServiceApplication {

    private static final Logger log = LoggerFactory.getLogger(ToolServiceApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(ToolServiceApplication.class, args);
        log.info("ToolShare Tool Service started on port 8083");
    }
}

