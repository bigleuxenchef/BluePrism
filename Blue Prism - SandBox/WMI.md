
wbemtest

tool to test wmi capabilities
worked/tested on windows 7 and 10








# Two areas to enable WMI
* Firewall in-out
* Windows Features for SNMP


## FireWall Rules for WMI



Firewall rules 


[https://msdn.microsoft.com/en-us/library/aa822854(v=vs.85).aspx]("https://msdn.microsoft.com/en-us/library/aa822854(v=vs.85).aspx")

```
To enable or disable WMI traffic at command prompt using WMI rule group

    Use the following commands at a command prompt. Type the following to enable WMI traffic through the firewall.

    netsh advfirewall firewall set rule group="windows management instrumentation (wmi)" new enable=yes

    Type the following command to disable WMI traffic through the firewall.

    netsh advfirewall firewall set rule group="windows management instrumentation (wmi)" new enable=no
```




# using RMI remotely

You can verify the availability of WinRM and configure a PowerShell for remoting by following these steps: 
1. Start Windows PowerShell as an administrator by right-clicking the Windows PowerShell shortcut and selecting Run As Administrator. 

2. The WinRM service is confi gured for manual startup by default. You must change the startup type to Automatic and start the service on each computer you want to work with. At the PowerShell prompt, you can verify that the WinRM service is running using the following command: 
get-service winrm
The value of the Status property in the output should be “Running”.

3. To configure Windows PowerShell for remoting, type the following command: 
Enable-PSRemoting –force

In many cases, you will be able to work with remote computers in other domains. However, if the remote computer is not in a trusted domain, the remote computer might not be able to authenticate your credentials. To enable authentication, you need to add the remote computer to the list of trusted hosts for the local computer in WinRM. To do so, type: 
winrm s winrm/config/client '@{TrustedHosts="RemoteComputer"}'
Here, RemoteComputer should be the name of the remote computer, such as: 
winrm s winrm/config/client '@{TrustedHosts="CorpServer56"}'

When you are working with computers in workgroups or homegroups, you must either use HTTPS as the transport or add the remote machine to the TrustedHosts configuration settings. If you cannot connect to a remote host, verify that the service on the remote host is running and is accepting requests by running the following command on the remote host: 
winrm quickconfig
This command analyzes and configures the WinRM service. 


```
command to add remote machine as trusted host
winrm s winrm/config/client '@{TrustedHosts="bpserver"}'
on  
make the connection private on both ends other wise the following message will happened on command Enable-PSRemoting –force
PS C:\WINDOWS\system32> Enable-PSRemoting –force
WinRM is already set up to receive requests on this computer.
Set-WSManQuickConfig : <f:WSManFault xmlns:f="http://schemas.microsoft.com/wbem/wsman/1/wsmanfault" Code="2150859113"
Machine="localhost"><f:Message><f:ProviderFault provider="Config provider"
path="%systemroot%\system32\WsmSvc.dll"><f:WSManFault xmlns:f="http://schemas.microsoft.com/wbem/wsman/1/wsmanfault"
Code="2150859113" Machine="bpserver"><f:Message>WinRM firewall exception will not work since one of the network
connection types on this machine is set to Public. Change the network connection type to either Domain or Private and
try again. </f:Message></f:WSManFault></f:ProviderFault></f:Message></f:WSManFault>
At line:116 char:17
+                 Set-WSManQuickConfig -force
+                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : InvalidOperation: (:) [Set-WSManQuickConfig], InvalidOperationException
    + FullyQualifiedErrorId : WsManError,Microsoft.WSMan.Management.SetWSManQuickConfigCommand


```
# get the status whether the remote capabiolity is enable
Enter-PSSession -ComputerName localhost

 Enable-PSRemoting –force

get status on trusted host
 i
set trusted host\h

set-item wsman:\localhost\Client\TrustedHosts -value *



then you can invoke a command remotely

Invoke-Command -ComputerName bpserver.vm -ScriptBlock {Get-ChildItem “C:\Program Files”}

 tasklist /FI "IMAGENAME eq automate.exe"
 # /F for force
 taskkill taskkill /f /im explore.exe 
