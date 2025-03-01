#from django.shortcuts import render, get_object_or_404, redirect
from .models import Product
#from .forms import ProductForm
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .serializers import ProductSerializer

# Create your views here.

#Show products
@api_view(['GET'])
def product_list(request):
	products = Product.objects.all()
	serializer = ProductSerializer(products, many=True)
	return Response(serializer.data)

#Add product
#def product_create(request):
#	if request.method == 'POST':
#		form = ProductForm(request.POST, request.FILES)
#		if form.is_valid():
#			form.save()
#			return redirect('product_list')
#	else:
#		form = ProductForm()
#	return render(request, 'products/product_form.html',{'form' : form})
#
#Update Product
#def product_update(request, pk):
#	product = get_object_or_404(Product, pk=pk)
#	if request.method == 'POST':
#		form = ProductForm(request.POST, request.FILES, instance=product)
#		if form.is_valid():
#			form.save()
#			return redirect('product_list')
#	else:
#		form = ProductForm(instance=product)
#	return render(request, 'products/product_form.html',{'form':form})
#
#Delete product
#def product_delete(request, pk):
#	product = get_object_or_404(Product, pk=pk)
#	if request.method == 'POST':
#		product.delete()
#		return redirect('product_list')
#	return render(request, 'products/product_confirm_delete.html',{'product':product})

