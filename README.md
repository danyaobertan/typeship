# TypeShip Container Management Tool

This repository describes at the pseudocode and using Linux commands how to create a simple container management tool implemented in TypeScript. The tool allows you to create, start, and stop containers, as well as execute commands inside the containers. 

## Table of Contents
[1. Introduction](#1-introduction)  
[2. Container Management Tool](#2-container-management-tool)  
[3. Container Management Tool Implementation](#3-container-management-tool-implementation)  
[4. Results](#4-results)  
[5. Conclusion](#5-conclusion)

## 1. Introduction
The Container Management Tool is a simple implementation in TypeScript that demonstrates the process of creating, starting, and stopping containers using Linux namespaces, cgroups, and overlay filesystems. The tool provides a basic understanding of how containerization works and how to manage containers programmatically.

## 2. Container Management Tool

The Container Management Tool comprises several functions that work together to create, start, and stop containers. Here is an overview of the main functions:

- `createContainer(containerName: string, baseImage: string): void`: This function creates a new container based on a specified base image. It sets up the container's root filesystem, creates namespaces for the container (PID, network, IPC, UTS, mount, user), sets resource limitations using cgroups (CPU, memory), and creates a copy-on-write (CoW) filesystem for the container.


- `startContainer(containerName: string, command: string): void`: This function starts a previously created container. It changes the root directory of the process to the container's filesystem, sets up container networking (if needed), sets up container-specific environment variables and user settings, and executes the specified command inside the container.


- `stopContainer(containerName: string, pathToContainers: string): void`: This function stops a running container. It performs cleanup operations such as stopping container processes, removing namespaces, cgroups, and other resources associated with the container.


- `copyFilesIntoContainer(containerName: string, sourcePath: string, destinationPath: string): void`: This function copies files from the host system into the container. It is useful for building the container's filesystem with necessary application files.


- `copyFilesOutOfContainer(containerName: string, sourcePath: string, destinationPath: string): void`: This function copies files from inside the container to the host system. It is commonly used to retrieve data generated during container execution.


- `setupCgroups(containerName: string): void`: This function sets resource limitations (e.g., CPU, memory) for a specific container using cgroups.


- `setupNetwork(containerName: string): void`: This function sets up container networking by connecting the container's network namespace to a bridge interface. It allows the container to communicate with the host and other containers in the same bridge.


- `executeCommand(command: string): void`: This function executes a specified command inside the container. It utilizes the `ip netns exec` command to execute the command within the container's network namespace.


- `createCoWFilesystem(containerName: string, baseImage: string, pathToContainers: string, pathToBaseImages: string): void`: This function creates a copy-on-write (CoW) filesystem for the container using overlayfs, based on the specified base image.


- `createNamespaces(containerName: string): void`: This function creates various namespaces (PID, network, IPC, UTS, mount, user) for the container using the `unshare` and `ip netns add` commands.


- `chrootToContainer(containerName: string, pathToContainers: string): void`: This function changes the root directory to the container's filesystem using the `chroot` command.


- `createDirectory(containerName: string, pathToContainers: string): void`: This function creates a directory for the container's root filesystem using the `mkdir` command.


- `setupContainerEnvironment(containerName: string): void`: This function sets up container-specific environment variables and user settings using the `export` and `useradd` commands.


- `cleanupContainer(containerName: string, pathToContainers: string): void`: This function cleans up container resources, stopping container processes, removing namespaces, cgroups, and other resources associated with the container.


- `main(): void`: This is the main function that orchestrates the container creation and execution process.

## 3. Container Management Tool Implementation

The implementation of the Container Management Tool is provided as a TypeScript code in the `containerManagement.ts` file. Each function in the code is documented with comments that describe the purpose of the function and the Linux commands it uses to achieve the desired functionalities.

To use the tool, follow these steps:

1. Clone this repository to your local machine.
```bash
git clone https://github.com/danyaobertan/typeship.git
```
2. Navigate to the project directory.

```bash
cd typeship
```

3. Install the required dependencies.

```bash
npm install
```

4. Build the TypeScript code.

```bash
tsc .\src\app.ts
```

5. Execute the main function to create and run a container.

```bash
node .\src\app.js
```
## 4. Results
```
Creating container my_container based on ubuntu_base_image.tar.gz ...

        Created directory /var/lib/containers/my_container/rootfs

        Created namespaces for my_container

        Set up cgroups for my_container

        Created Copy-on-Write filesystem for my_container and base image ubuntu_base_image.tar.gz at /var/lib/containers/my_container/rootfs with upper and work layers at /var/lib/containers/my_container/upper and /var/lib/containers/my_container/work

Successfully created container my_container based on ubuntu_base_image.tar.gz !!!

Copying files into container my_container from app_files/ to /app/ ...

        Copied files from app_files/ to my_container/app/

Successfully copied files into container my_container from app_files/ to /app/ !!!

Starting container my_container ...

        Changed root directory to /var/lib/containers/my_container/rootfs

        Set up network for my_container

        Set up environment for my_container

        Executed command script.sh

Successfully started container my_container !!!

Copying files out of container my_container from /app/logs/ to logs/ ...

        Copied files from my_container/app/logs/ to logs/

Successfully copied files out of container my_container from /app/logs/ to logs/ !!!

Stopping container my_container ...

        Cleaned up resources for my_container at /var/lib/containers/my_container

Successfully stopped container my_container !!!
```
## 5. Conclusion

The Container Management Tool provides a simplified implementation of containerization using Linux namespaces and other Linux commands. It is designed for educational and experimental purposes, and it may not provide all the features and security considerations of production-grade containerization systems like Docker or Kubernetes.

