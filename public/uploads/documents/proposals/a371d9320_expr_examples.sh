#!/bin/zsh

# An example of using an expr command

var1=2
var2=5

var3=$(expr $var2 / $var1)

echo The result is $var3
