/******************************************************************************

                            Online Java Compiler.
                Code, Compile, Run and Debug java program online.
Write your code in this editor and press "Run" button to execute it.

*******************************************************************************/

public class Main
{
	public static void main(String[] args) {
		System.out.println("Hello World");
		
		int arr[] = {11,14,2,1,3,5,7};
		Main obj  = new Main();
		arr = obj.twoSum( arr, 9, 0,1);
		System.out.println(arr[0]+ ", "+arr[1]);
	}
	
	
	public int[] twoSum(int[] nums, int target, int i, int j) {
	    System.out.println("i = "+ i + ", j = "+ j);
           if(nums[i] + nums[j] == target)
            return new int[] {i,j};
            
           else if(j<nums.length-1)
                   return twoSum( nums, target, i,++j);
                   
            if(i<nums.length-2)
                 return twoSum( nums, target, ++i, j=i+1);
                 
        return new int[] {-1,-1};         
        
    }
}
