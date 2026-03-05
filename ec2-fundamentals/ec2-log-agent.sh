#!/bin/bash
yum update -y

# install apache server
yum install -y httpd
systemctl start httpd
systemctl enable httpd
echo "<h1>Hello World from $(hostname -f)</h1>" > /var/www/html/index.html

# install from pkg manager
yum install -y amazon-cloudwatch-agent
# start agent
mkdir -p /usr/share/collectd
touch /usr/share/collectd/types.db
#/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c ssm:okmen-ec2-cloudwatch-agent-config
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c ssm:AmazonCloudWatch-okmen-linux