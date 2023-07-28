// Path to the directory where containers are stored
const pathToContainers = '/var/lib/containers';

// Path to the directory where base images are stored
const pathToBaseImages = '/var/lib/baseImages';

// Function to create a new container
const createContainer = (containerName: string, baseImage: string): void => {

    console.log(`\nCreating container ${containerName} based on ${baseImage} ...`);

    // Create a directory for the container's root filesystem
    createDirectory(containerName, pathToContainers);

    // Create namespaces for the container (PID, network, IPC, UTS, mount, user)
    createNamespaces(containerName);

    // Set up cgroups for resource limitations (CPU, memory, etc.)
    setupCgroups(containerName);

    // Create a copy-on-write filesystem for the container
    createCoWFilesystem(containerName, baseImage, pathToContainers, pathToBaseImages);

    console.log(`\nSuccessfully created container ${containerName} based on ${baseImage} !!!`);

};

// Function to start a container
const startContainer = (containerName: string, command: string): void => {
    console.log(`\nStarting container ${containerName} ...`);
    // Change the root directory of the process to the container's filesystem
    chrootToContainer(containerName, pathToContainers);

    // Set up container networking (if needed)
    setupNetwork(containerName);

    // Set up container environment variables, user, etc.
    setupContainerEnvironment(containerName);

    // Execute the specified command inside the container
    executeCommand(command);
    console.log(`\nSuccessfully started container ${containerName} !!!`);
};

// Function to stop a container
const stopContainer = (containerName: string, pathToContainers: string): void => {
    console.log(`\nStopping container ${containerName} ...`);
    // Cleanup - stop container processes, remove namespaces, cgroups, etc.
    cleanupContainer(containerName, pathToContainers);
    console.log(`\nSuccessfully stopped container ${containerName} !!!`);
};

// Function to copy files into the container (for build purposes)
const copyFilesIntoContainer = (containerName: string, sourcePath: string, destinationPath: string): void => {
    console.log(`\nCopying files into container ${containerName} from ${sourcePath} to ${destinationPath} ...`);
    // Copy files into the container's filesystem
    copyFiles(sourcePath, containerName + destinationPath);
    console.log(`\nSuccessfully copied files into container ${containerName} from ${sourcePath} to ${destinationPath} !!!`);
};

// Function to copy files out of the container (after container execution)
const copyFilesOutOfContainer = (containerName: string, sourcePath: string, destinationPath: string): void => {
    console.log(`\nCopying files out of container ${containerName} from ${sourcePath} to ${destinationPath} ...`);
    // Copy files out of the container's filesystem
    copyFiles(containerName + sourcePath, destinationPath);
    console.log(`\nSuccessfully copied files out of container ${containerName} from ${sourcePath} to ${destinationPath} !!!`);
};

// Function to set resource limitations (e.g., CPU, memory) for a container
const setupCgroups = (containerName: string): void => {
    // Set resource limitations using cgroups for the specified container

    // Example of CPU Limitation:

    // Create a new cgroup directory for CPU
    // sudo mkdir /sys/fs/cgroup/cpu/$containerName

    // Set the CPU usage limit for the cgroup (in this example, 50%)
    // echo 50000 | sudo tee /sys/fs/cgroup/cpu/$containerName/cpu.cfs_quota_us
    // echo 100000 | sudo tee /sys/fs/cgroup/cpu/$containerName/cpu.cfs_period_us

    // Example of Memory Limitation:

    // Create a new cgroup directory for memory
    // sudo mkdir /sys/fs/cgroup/memory/$containerName

    // Set the memory usage limit for the cgroup (in this example, 512MB)
    // echo 512M | sudo tee /sys/fs/cgroup/memory/$containerName/memory.limit_in_bytes

    // Explanation:
    // - We create a new cgroup directory for the container in the cgroup filesystem.
    // - We set the CPU usage limit for the cgroup by writing the CPU quota and period to the cgroup's cpu.cfs_quota_us and cpu.cfs_period_us files.
    // - We set the memory usage limit for the cgroup by writing the memory limit to the cgroup's memory.limit_in_bytes file.

    console.log(`\n\tSet up cgroups for ${containerName}`)
};

// Function to set up container networking
const setupNetwork = (containerName: string): void => {
    // Connect the container's network namespace to the bridge

    // Example using 'ip' command:
    // ip link add vethHost type veth peer name vethContainer
    // ip link set vethHost up
    // ip link set vethContainer netns $containerName
    // ip netns exec $containerName ip link set vethContainer up
    // ip netns exec $containerName ip addr add 192.168.0.2/24 dev vethContainer
    // brctl addif br0 vethHost

    // Explanation:
    // - We create a virtual Ethernet pair 'vethHost' and 'vethContainer'.
    // - 'vethHost' will be in the host network namespace, and 'vethContainer' will be in the container's network namespace.
    // - We bring 'vethHost' up and move 'vethContainer' to the container's network namespace using 'ip link set'.
    // - Inside the container's network namespace, we bring 'vethContainer' up, assign an IP address to it, and add it to the bridge 'br0'.
    // - The bridge 'br0' is an existing bridge interface that allows the container to communicate with the host and other containers in the same bridge.

    console.log(`\n\tSet up network for ${containerName}`)
};


// Function to execute a command inside the container
const executeCommand = (command: string): void => {
    // Execute a command inside the container

    // Example of executing a command in the container's network namespace:
    // ip netns exec $containerName $command

    // Explanation:
    // - 'ip netns exec' is a command that allows to run a command in the context of a specific network namespace.
    // - '$containerName' specifies the network namespace to execute the command in.
    // - '$command' is the actual command to run inside the container.

    console.log(`\n\tExecuted command ${command}`)
};

// Function to create CoW (Copy-on-Write) filesystem for the container
const createCoWFilesystem = (containerName: string, baseImage: string, pathToContainers: string, pathToBaseImages: string): void => {
    // Use overlays to create a CoW filesystem based on the specified base image

    // Example using overlays:
    // mkdir -p /path/to/containers/$containerName/upper
    // mkdir -p /path/to/containers/$containerName/work
    // mount -t overlay -o lowerdir=$pathToBaseImages/$baseImage,upperdir=$pathToContainers/$containerName/upper,workdir=$pathToContainers/$containerName/work $pathToContainers/$containerName/rootfs

    // Explanation:
    // - We create directories to store the upper and work layers of the overlay filesystem.
    // - We then use the 'mount' command to mount the overlay filesystem.
    //   - 'lowerdir' points to the read-only base image from which changes will be copied.
    //   - 'upperdir' is where the changes made within the container will be stored (the writable layer).
    //   - 'workdir' is an internal working directory required by overlays.
    //   - The rootfs directory of the container will be the merged view of the base image and the changes made in the container.

    console.log(`\n\tCreated Copy-on-Write filesystem for ${containerName} and base image ${baseImage} at ${pathToContainers}/${containerName}/rootfs with upper and work layers at ${pathToContainers}/${containerName}/upper and ${pathToContainers}/${containerName}/work`)
};

// Function to create namespaces for the container
const createNamespaces = (containerName: string): void => {
    // Create PID, network, IPC, UTS, mount, user namespaces

    // Example using 'unshare' command:

    // Create PID namespace
    // unshare --fork --pid

    // Create network namespace
    // ip netns add $containerName

    // Create IPC namespace
    // unshare --fork --ipc

    // Create UTS namespace
    // unshare --fork --uts

    // Create mount namespace
    // unshare --fork --mount

    // Create user namespace
    // unshare --fork --user

    // Explanation:
    // - We use the 'unshare' command to create namespaces.
    // - The '--fork' option is used to fork a new process for the namespace.

    console.log(`\n\tCreated namespaces for ${containerName}`)
};

// Function to change the root directory to the container's filesystem
const chrootToContainer = (containerName: string, pathToContainers: string): void => {
    // Change the root directory to the container's filesystem

    // Example using 'chroot' command:
    // chroot $pathToContainers/$containerName/rootfs

    // Explanation:
    // - 'chroot' is the command used to change the root directory to a specified path.
    // - ' $pathToContainers/$containerName/rootfs' is the path to the container's root filesystem.
    // - After executing this command, the specified directory becomes the new root directory for the current process and its children.
    // - The process and its children will only have access to files and directories within the container's root filesystem, making it isolated from the host's root filesystem.

    console.log(`\n\tChanged root directory to ${pathToContainers}/${containerName}/rootfs`)
};

// Function to create a directory for the container's root filesystem
const createDirectory = (containerName: string, pathToContainers: string): void => {
    // Create the container's root directory

    // Example using 'mkdir' command:
    const containerRootDir = `${pathToContainers}/${containerName}/rootfs`;
    // mkdir -p $containerRootDir

    // Explanation:
    // - 'mkdir' is the command for creating directories in Linux.
    // - '-p' is the flag for creating parent directories if they don't exist.

    console.log(`\n\tCreated directory ${containerRootDir}`)
};

// Function to copy files from sourcePath to destinationPath
const copyFiles = (sourcePath: string, destinationPath: string): void => {
    // Copy files from sourcePath to destinationPath

    // Example using 'cp' command:
    // cp -r $sourcePath/* $destinationPath/

    // Explanation:
    // - 'cp' is the command for copying files in Linux.
    // - '-r' is the recursive flag, used to copy directories and their contents.
    // - '/path/to/sourcePath/*' specifies the contents of the source directory (all files and directories within it).
    // - '/path/to/destinationPath/' is the target directory where the files will be copied.

    console.log(`\n\tCopied files from ${sourcePath} to ${destinationPath}`)
};

// Function to set up container environment variables, user, etc.
const setupContainerEnvironment = (containerName: string): void => {
    // Set up container-specific environment variables and user settings

    // Example of setting environment variables:
    // export CONTAINER_NAME=$containerName
    // export DB_HOST=localhost
    // export DB_PORT=3306

    // Explanation:
    // - Environment variables can be set within the current shell session using the 'export' command.
    // - These environment variables can be used to pass configuration information or settings to the processes running inside the container.
    // - The example sets up a few environment variables, including 'CONTAINER_NAME', 'DB_HOST', and 'DB_PORT'.

    // Example of setting up a specific user inside the container:
    // useradd -m -u 1000 -s /bin/bash $containerName

    // Explanation:
    // - 'useradd' is a command used to add a new user to the system.
    // - The '-m' flag creates a home directory for the user.
    // - The '-u 1000' flag assigns the user ID (UID) 1000 to the new user (adjust the UID as needed).
    // - The '-s /bin/bash' flag sets the default shell for the user to '/bin/bash'.
    // - '$containerName' specifies the name of the user (it's often the same as the container name).

    console.log(`\n\tSet up environment for ${containerName}`)
};

// Function to clean up container resources
const cleanupContainer = (containerName: string,pathToContainers:string): void => {
    // Stop container processes, remove namespaces, cgroups, etc.

    // Example of stopping container processes:
    // killall -9 -r ".*"

    // Explanation:
    // - 'killall' is a command used to send signals to processes based on their names.
    // - '-9' specifies the SIGKILL signal, which forcefully terminates the processes.
    // - '-r ".*"' is a regular expression that matches all process names. This is used to terminate all processes within the container.

    // Example of removing namespaces:
    // ip netns delete $containerName
    // umount $pathToContainers/$containerName/rootfs/proc
    // umount $pathToContainers/$containerName/rootfs/sys
    // ...

    // Explanation:
    // - 'ip netns delete' removes the network namespace associated with the container.
    // - 'umount' is used to unmount the proc and sys filesystems from the container's rootfs, which were mounted during namespace setup.
    // - Additional cleanup actions may include unmounting other mounted filesystems, cgroups removal, or any other resources created during container setup.

    console.log(`\n\tCleaned up resources for ${containerName} at ${pathToContainers}/${containerName}`)
};

// Main function to create and run a container
const main = (): void => {
    const containerName = 'my_container';
    const baseImage = 'ubuntu_base_image.tar.gz';
    createContainer(containerName, baseImage);

    copyFilesIntoContainer(containerName, 'app_files/', '/app/');

    startContainer(containerName, 'script.sh');

    copyFilesOutOfContainer(containerName, '/app/logs/', 'logs/');

    stopContainer(containerName,pathToContainers);
};

// Run the main function to create and run the container
main();
