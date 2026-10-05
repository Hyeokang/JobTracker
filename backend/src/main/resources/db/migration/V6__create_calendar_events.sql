CREATE TABLE calendar_events (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    application_id UUID,
    title VARCHAR(200) NOT NULL,
    event_type VARCHAR(30) NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME,
    notes VARCHAR(1000),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_calendar_events_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_calendar_events_application FOREIGN KEY (application_id) REFERENCES applications (id) ON DELETE CASCADE
);

CREATE INDEX idx_calendar_events_user_date ON calendar_events (user_id, event_date);
