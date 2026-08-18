package com.toolshare.booking.event;

public interface NotificationPublisher {
    void publish(NotificationEvent event);
}

