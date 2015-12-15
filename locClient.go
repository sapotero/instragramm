package main

import (
    "bytes"
    "fmt"
    "time"
    "io"
    "io/ioutil"
    "mime/multipart"
    "net/http"
    "os"
    "github.com/gosexy/exif"
)

func Upload(url, file string) (err error) {
    // Prepare a form that you will submit to that URL.

    reader := exif.New()
    reader.Open(file)
    if err != nil {
        fmt.Printf("Error: %s", err.Error())
    }
    // for key, val := range reader.Tags {
    //     fmt.Printf("%s: %s\n", key, val)
    // }




    var b bytes.Buffer
    w := multipart.NewWriter(&b)
    // Add your image file
    f, err := os.Open(file)
    if err != nil {
        return
    }
    fw, err := w.CreateFormFile("image", file)
    if err != nil {
        return
    }
    if _, err = io.Copy(fw, f); err != nil {
        return
    }
    // Add the other fields
    if fw, err = w.CreateFormField("key"); err != nil {
        return
    }
    
    if fw, err = w.CreateFormField("camid"); err != nil {
        return
    }

    // func (w *Writer) WriteField(fieldname, value string) error

    if err = w.WriteField("camid", "56"); err!= nil {
        return
    }

    // if _, err = fw.Write([]byte("KEY")); err != nil {
    //     return
    // }
    // Don't forget to close the multipart writer.
    // If you don't close it, your request will be missing the terminating boundary.
    w.Close()

    // Now that you have a form, you can submit it to your handler.
    req, err := http.NewRequest("POST", url, &b)
    if err != nil {
        return
    }
    // Don't forget to set the content type, this will contain the boundary.
    req.Header.Set("Content-Type", w.FormDataContentType())
    req.Header.Set("camId", "CAM54")
    req.Header.Set("token", "testtesttest")
    req.Header.Set("datetime", reader.Tags["Date and Time"])
    
    // Submit the request
    client := &http.Client{}
    res, err := client.Do(req)
    if err != nil {
        return
    }

    // Check the response
    if res.StatusCode != http.StatusOK {
        err = fmt.Errorf("bad status: %s", res.Status)
    }
    
    if res.StatusCode == http.StatusOK {
        fmt.Println("Transfer ok. Deleting file... "+file+"\n")
    }


    return
}

func main() {
    files, _ := ioutil.ReadDir("./images")
    for _, f := range files {
        fmt.Println( "./images/"+f.Name())
        Upload("http://localhost:8080/upload", "./images/"+f.Name())
        timer := time.NewTimer(time.Second * 3)
        <-timer.C
    }
}
