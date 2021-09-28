#include <fstream>
#include<stdio.h>
#include<stdlib.h>
#include<unistd.h>
#include<iostream>

using namespace std;

int main(int argc, char *argv[]){
    char *fvalue;
    char *ivalue;
    int c;
    opterr = 0;
    string line;
    int indent;
    
    // Checking specified file flag
    while((c = getopt(argc, argv, "f:i:")) != -1){
        switch (c){
            case 'f':
                fvalue = optarg;
                break;
            
            case 'i':
                ivalue = optarg;
                break;

            case '?':
                cout<<optopt;
                if(to_string(optopt) == "f" || to_string(optopt) == "i"){
                    fprintf (stderr, "Options -%f and -%i require an argument.\n", (double)optopt);
                }
                else if(isprint(optopt)){
                    fprintf (stderr, "Unknown option `-%f'.\n", double(optopt));
                }
                else{
                     fprintf (stderr,
                   "Unknown option character `\\x%x'.\n",
                   optopt);
                }
                return 1;
            
            default:
                abort();

        }

    }
    indent = atoi(ivalue);

    fstream myFile;
    ofstream write;

    myFile.open(fvalue);
    write.open("new_file.txt");

    if(!myFile){
        cout << "Get good";
        return 0;
    }
    
    // Going in every line of file
    while(myFile){
        getline(myFile, line);

        // End of file
        if(line == "-1"){
            break;
        }
        line.erase(0, indent);
        write << line << endl;
    }
    myFile.close();

}