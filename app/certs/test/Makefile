.PHONY: clean default

FQDN_SERV ?= 127.0.0.1
PASS ?= password
FQDN_CLIENT1 ?= 127.0.0.1
FQDN_CLIENT2 ?= 127.0.0.1

default: 
	make server-crt.pem
	make client1-crt.pem
	make client2-crt.pem
	rm -f *.cnf
	rm -f *.srl
clean:
	rm -f *.pem
	rm -f *.cnf
	rm -f *.srl

client1.cnf:
	PASSWORD=$(PASS) CLIENT1=$(FQDN_CLIENT1) envsubst < client1.conf > client1.cnf
client2.cnf:
	PASSWORD=$(PASS) CLIENT2=$(FQDN_CLIENT2) envsubst < client2.conf > client2.cnf
server.cnf:
	PASSWORD=$(PASS) SERVER=$(FQDN_SERV) envsubst < server.conf > server.cnf
ca.cnf:
	PASSWORD=$(PASS) envsubst < ca.conf > ca.cnf

ca-crt.pem: ca.cnf
	openssl req -new -x509 -days 9999 -config ca.cnf -keyout ca-key.pem -out ca-crt.pem

server-key.pem:
	openssl genrsa -out server-key.pem 4096

server-csr.pem: server.cnf server-key.pem
	openssl req -new -config server.cnf -reqexts san_env -key server-key.pem -out server-csr.pem

server-crt.pem: server.cnf ca-crt.pem server-csr.pem
	openssl x509 -req -extfile server.cnf -extensions san_env -days 999 -passin "pass:$(PASS)" -in server-csr.pem -CA ca-crt.pem -CAkey ca-key.pem -CAcreateserial -out server-crt.pem

client1-key.pem:
	openssl genrsa -out client1-key.pem 4096

client2-key.pem:
	openssl genrsa -out client2-key.pem 4096

client1-csr.pem: client1.cnf client1-key.pem
	openssl req -new -config client1.cnf -reqexts san_env -key client1-key.pem -out client1-csr.pem

client2-csr.pem: client2.cnf client2-key.pem
	openssl req -new -config client2.cnf -reqexts san_env -key client2-key.pem -out client2-csr.pem

client1-crt.pem: client1.cnf ca-crt.pem client1-csr.pem
	openssl x509 -req -extfile client1.cnf -extensions san_env -days 999 -passin "pass:$(PASS)" -in client1-csr.pem -CA ca-crt.pem -CAkey ca-key.pem -CAcreateserial -out client1-crt.pem

client2-crt.pem: client2.cnf ca-crt.pem client2-csr.pem
	openssl x509 -req -extfile client2.cnf -extensions san_env -days 999 -passin "pass:$(PASS)" -in client2-csr.pem -CA ca-crt.pem -CAkey ca-key.pem -CAcreateserial -out client2-crt.pem
