CREATE TABLE applications (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    job_posting_id UUID NOT NULL,
    status VARCHAR(30) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_applications_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_applications_job_posting FOREIGN KEY (job_posting_id) REFERENCES job_postings (id) ON DELETE CASCADE,
    CONSTRAINT uk_applications_user_job_posting UNIQUE (user_id, job_posting_id)
);

CREATE INDEX idx_applications_user_updated_at ON applications (user_id, updated_at DESC);
CREATE INDEX idx_applications_status ON applications (user_id, status);

CREATE TABLE application_events (
    id UUID PRIMARY KEY,
    application_id UUID NOT NULL,
    previous_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    note VARCHAR(1000),
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_application_events_application FOREIGN KEY (application_id) REFERENCES applications (id) ON DELETE CASCADE
);

CREATE INDEX idx_application_events_application_occurred_at
    ON application_events (application_id, occurred_at DESC);
