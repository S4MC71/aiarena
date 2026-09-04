# Arena Web Security Practice Lab & OpenVPN Guide

## 1. Connecting to the Arena Private Lab
To practice ethical hacking and exploit the vulnerable target machines, students must connect to the Arena private VPN network.

### Step-by-Step Connection Instructions:
1. Log in to your **Arena Student Dashboard**.
2. Navigate to **VPN & Labs** and download your configuration file: `arena-student.ovpn`.
3. Open your terminal in Kali Linux or Ubuntu and start OpenVPN:
   ```bash
   sudo openvpn --config arena-student.ovpn
   ```
4. Wait until you see: `Initialization Sequence Completed`.
5. Open a new terminal tab and verify you can reach the lab gateway:
   ```bash
   ping -c 3 10.10.10.1
   ```

## 2. Target Machines & IP Addressing
- Lab targets are allocated in the `10.10.10.0/24` subnet.
- Every student has access to 15+ dedicated machines simulating real-world enterprise web applications.
- Target instances automatically reset every 2 hours to maintain clean environments.
- If a target service crashes or hangs during an exploit attempt, go to your Student Dashboard and click **"Reset Instance"** to deploy a fresh container in 30 seconds.

## 3. Rules of Engagement
- Only attack targets within your assigned IP ranges (`10.10.10.x`).
- Do not perform Denial of Service (DoS/DDoS) attacks against lab infrastructure.
- Automated brute force is only allowed when explicitly specified in the challenge instructions.
