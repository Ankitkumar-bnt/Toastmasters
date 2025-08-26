package com.app.toastmasters.exceptions;

public class AuthenticationFailedException extends RuntimeException{

    public AuthenticationFailedException(String message){ super(message);}
}
