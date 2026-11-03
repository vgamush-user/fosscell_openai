#include <stdio.h>
#include <stdlib.h>

/**
 * Level 2: Debugging Inconsistencies
 * 
 * Your task:
 * 1. Identify and fix code inconsistencies.
 * 2. Address the mixed coding styles (indentation, naming).
 * 3. Find potential memory leaks or undefined behaviors.
 * 4. Ensure error handling is consistent.
 */


void swap_elements(int *a, int *b) {
    int t = *a;
    *a = *b;
    *b = t;
}

int partition_array(int arr[], int low, int high) {
    int pivot = arr[high];
    int i = (low - 1);

    for (int j = low; j <= high - 1; j++) {
        if (arr[j] < pivot) {
            i++;
            swap_elements(&arr[i], &arr[j]);
        }
    }
    swap_elements(&arr[i + 1], &arr[high]);
    return (i + 1);
}

void quick_sort(int arr[], int low, int high) {
    if (low < high) {
        int pi = partition_array(arr, low, high);
        quick_sort(arr, low, pi - 1);
        quick_sort(arr, pi + 1, high);
    }
}

void print_array(int arr[], int size) {
    for (int i = 0; i < size; i++)
        printf("%d ", arr[i]);
    printf("\n");
}

int main(void) {
    int *data = malloc(10 * sizeof(*data));
    if (data == NULL) {
        fprintf(stderr, "Unable to allocate array\n");
        return EXIT_FAILURE;
    }
    
    // Hardcoded test
    data[0] = 10; data[1] = 7; data[2] = 8; data[3] = 9; data[4] = 1;
    data[5] = 5; data[6] = 2; data[7] = 3; data[8] = 4; data[9] = 6;

    printf("Original array: \n");
    print_array(data, 10);

    quick_sort(data, 0, 9);
    
    printf("Sorted array: \n");
    print_array(data, 10);

    free(data);
    return EXIT_SUCCESS;
}
