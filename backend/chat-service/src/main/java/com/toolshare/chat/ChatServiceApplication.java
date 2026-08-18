package com.toolshare.chat;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class ChatServiceApplication {

    private static final Logger log = LoggerFactory.getLogger(ChatServiceApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(ChatServiceApplication.class, args);
        log.info("ToolShare Chat Service started on port 8085");
    }
}

