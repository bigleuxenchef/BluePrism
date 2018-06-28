
# Integrate graphics resolution as well as drag and drop through Virtualbox guest extension

for drag and drop from Mac to windows, install the extension

[https://www.virtualbox.org/manual/ch04.html#additions-windows](virtualbox reference)
[https://www.youtube.com/watch?v=Bb_kJd3lSxQ](youtube tutorial)

- Elastisearch vs. Dynatrace 

[https://www.dynatrace.com/technologies/elasticsearch-monitoring/](Elstic vs. Dynatrace)

dynatrace and elastic can be seen as competing offering

Dynatrace architecture
https://community.dynatrace.com/community/display/DOCDT63/Architecture
search engine for dynatrace is elastic meaning data series should be in elastic first
https://www.dynatrace.com/platform/dynatrace-architecture/
# NETWORK CONFIGURATION



VBoxManage hostonlyif remove vboxnet0 # remove interface


Virtualbox setting

VBoxManage modifyvm "VM name" --natdnshostresolver1 on

vboxmanage dhcpserver modify --netname HostInterfaceNetworking-vboxnet0 --disable
vboxmanage list dhcpservers


setting port forwarding
#just needto be added in file /etc/sysctl.conf to be loaded at boot time
sudo sysctl net.inet.ip.forwarding=1
sudo sysctl net.inet6.ip6.forwarding=1



sudo vi /etc/pf.conf
nat on en0 from 192.168.56.0/24 to any -> { (en0) (en1)}


sudo pfctl -F all -f /etc/pf.conf

 sudo pfctl -e




# activate pfctl at run time

## 2 ways

### 1 modify the plist file


The problem was that there is a default plist for pfctl at /System/Library/LaunchDaemons/com.apple.pfctl.plist. They were conflict.

In that plist I set <key>Disabled</key> to <true/>, and everything works as expected.

### 2 use the command shell 

sudo launchctl load /System/Library/LaunchDaemons/com.apple.pfctl.plist





nslookup www.google.com # call dns

scutil --dns # provide the dns list



#### IMPORTANT : this file needs to content the right entries


Resolv.conf

domain hitronhub.home
nameserver 192.168.56.1
nameserver 127.0.0.1
nameserver 192.168.0.1


When at the bank it should contain 

domain <example.guest.com>
nameserver 192.168.192.6/192.168.128.6
nameserver 192.168.56.1
nameserver 127.0.0.1
nameserver 192.168.0.1



# get process listening on interface and ip adresses
lsof -i | grep -i listen





# command on september 05

  517  sudo pfctl -F all -f /etc/pf.conf
 
  521  sudo pfctl -e
  522  vboxmanage list dhcpservers
  523  sudo sysctl net.inet.ip.forwarding
  524  sudo sysctl net.inet.ip.forwarding=1
  
# repair database suspect

launch sql server management

  
  
  
  exec sp_resetstatus BluePrismTraining
ALTER DATABASE BluePrismTraining set emergency
dbcc checkdb(BluePrismTraining)
ALTER DATABASE BluePrismTraining SET SINGLE_USER WITH ROLLBACK IMMEDIATE
DBCC CheckDB (BluePrismTraining, REPAIR_ALLOW_DATA_LOSS)
alter database BluePrismTraining set Multi_user
ALTER DATABASE BluePrismTraining set online


  
 # dnsmasq
 ```bash
 sudo mkdir -v /etc/resolver
more /etc/resolver/vm
nameserver 127.0.0.1
nameserver 192.168.56.1
domain vm
 ```
 
 
 brew install iproute2mac
 
 
