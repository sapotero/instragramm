// Copyright 2015 The Gorilla WebSocket Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

// +build ignore

package main

import (
  "flag"
  "log"
  "net/url"
  "os"
  "os/signal"
  "time"
  "encoding/json"
  "github.com/gorilla/websocket"
  "strings"
  "io"
)

var addr = flag.String("addr", "localhost:8082", "http service address")

type Message struct {
  state, action string
}
// var STATE  = "init";
// var ACTION = "";

func main() {
  flag.Parse()
  log.SetFlags(0)

  interrupt := make(chan os.Signal, 1)
  signal.Notify(interrupt, os.Interrupt)

  u := url.URL{Scheme: "ws", Host: *addr, Path: "/echo"}
  log.Printf("connecting to %s", u.String())

  c, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
  if err != nil {
    log.Fatal("dial:", err)
  }
  defer c.Close()

  done := make(chan struct{})
  go func() {
    defer c.Close()
    defer close(done)
    for {
      _, message, err := c.ReadMessage()
      if err != nil {
        log.Println("read:", err)
        return
      }
      
      msg := string(message)

      
      
      
      
      time.Sleep(2 * time.Second)

      dec := json.NewDecoder(strings.NewReader( msg ))
      for {
        var m Message
        if err := dec.Decode(&m); err == io.EOF {
          break
        } else if err != nil {
          log.Fatal(err)
        }

        log.Printf("%s", m);
        log.Println("%s: %s\n", m.state, m.action)

        switch string(m.state) {
          case "init":
            m, err := json.Marshal( Message{ state: "init", action: "init" } )
            if err != nil {
                panic (err)
            }
            log.Println("***",m)
            c.WriteMessage( websocket.TextMessage, m)
          case "tryAuth":
            c.WriteMessage( websocket.TextMessage, []byte("auth") )
          case "ready":
            c.WriteMessage( websocket.TextMessage, []byte("ready") )
            c.WriteMessage( websocket.TextMessage, []byte("ping") )
          case "wait":
            c.WriteMessage( websocket.TextMessage, []byte("init") )
          case "ping":
            c.WriteMessage( websocket.TextMessage, []byte("ping") )
          case "authError":
            c.WriteMessage( websocket.TextMessage, []byte("init") )
          default:
            log.Println("unrecognized escape character")
        }
      log.Printf("-> %s", message)
      }


    }
  }()

  ticker := time.NewTicker(time.Second)
  defer ticker.Stop()

  for {
    select {
    // case t := <-ticker.C:
      // err := c.WriteMessage(websocket.TextMessage, []byte(t.String()))
      // c.WriteMessage( websocket.TextMessage, []byte("ss") )

      // if err != nil {
      //   log.Println("write:", err)
      //   return
      // }

    case <-interrupt:
      log.Println("interrupt")
      // To cleanly close a connection, a client should send a close
      // frame and wait for the server to close the connection.
      err := c.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""))
      if err != nil {
        log.Println("write close:", err)
        c.Close()
        return
      }
      select {
      case <-done:
      case <-time.After(time.Second):
      }
      c.Close()
      return
    } 
  }
}