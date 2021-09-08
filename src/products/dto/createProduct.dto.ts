import { IsString, IsInt, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export default class CreateProductDto {
  @ApiProperty({
    description: 'Available amount for product',
    type: 'number',
  })
  @Min(1)
  @IsNotEmpty()
  @IsInt()
  amount_available: number;

  @ApiProperty({
    description: 'Cost of the product',
    type: 'number',
  })
  @Min(5)
  @IsNotEmpty()
  @IsInt()
  cost: number;

  @ApiProperty({
    description: 'Product name',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  product_name: string;
}
