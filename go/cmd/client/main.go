package main

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"connectrpc.com/connect"
	v1 "github.com/ichi-h/komoriuta/go/pkg/komoriuta/v1"
	"github.com/ichi-h/komoriuta/go/pkg/komoriuta/v1/komoriutav1connect"
)

func main() {
	// ConnectRPCクライアントを作成
	client := komoriutav1connect.NewAuthServiceClient(
		http.DefaultClient,
		"http://localhost:8080",
	)

	// Loginリクエストを作成
	req := connect.NewRequest(&v1.LoginRequest{
		UserId:   "test-user",
		Password: "test-password",
	})

	// リクエストを送信
	res, err := client.Login(context.Background(), req)
	if err != nil {
		log.Fatalf("Login failed: %v", err)
	}

	// レスポンスを表示
	fmt.Printf("Login response:\n")
	fmt.Printf("  Success: %v\n", res.Msg.Success)
	if res.Msg.FailedAttempts != nil {
		fmt.Printf("  Failed attempts: %d\n", *res.Msg.FailedAttempts)
	} else {
		fmt.Printf("  Failed attempts: (not set)\n")
	}

	// Verifyリクエストを送信
	verifyReq := connect.NewRequest(&v1.VerifyRequest{})
	verifyRes, err := client.Verify(context.Background(), verifyReq)
	if err != nil {
		log.Fatalf("Verify failed: %v", err)
	}

	fmt.Printf("\nVerify response:\n")
	fmt.Printf("  Authenticated: %v\n", verifyRes.Msg.Authenticated)

	// Logoutリクエストを送信
	logoutReq := connect.NewRequest(&v1.LogoutRequest{})
	logoutRes, err := client.Logout(context.Background(), logoutReq)
	if err != nil {
		log.Fatalf("Logout failed: %v", err)
	}

	fmt.Printf("\nLogout response:\n")
	fmt.Printf("  Success: %v\n", logoutRes.Msg.Success)
}
