package com.example.demo.model;

public class ReviewComment {
    private String file;
    private int line;
    private String comment;
    private String severity;

    public String getFile() { return file; }
    public void setFile(String file) { this.file = file; }

    public int getLine() { return line; }
    public void setLine(int line) { this.line = line; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
}
