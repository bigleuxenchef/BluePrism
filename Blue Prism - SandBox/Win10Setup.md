disabling cortana

open regedit and set the key 
HKEY_LOCAL_MACHINE > Software > Policies > Microsoft > Windows > Windows Search > AllowCortana
to
0
if the key does no exist create it

(https://www.pcworld.com/article/2949759/windows/killing-cortana-how-to-disable-windows-10s-info-hungry-digital-assistant.html)




# USING NSSM

[https://nssm.cc/commands](nssm commands)

# JDBC Driver

sqljdbc_auth.dll needs to be in the path, on windows either change the path or change the bat file
be careful to use the right arch 32 or 64 bits according to your jvm



# SandBox all on windows 7

install java jdk for allowing using VisualVM