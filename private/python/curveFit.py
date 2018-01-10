import scipy
import numpy as np
from scipy.optimize import curve_fit
from scipy.optimize import minimize_scalar
import math
from pymongo import MongoClient
import sys

# curveFit version
version = '1.0.0'

class DbManager:
    """
    Full of static methods used throughout the program to query the database.
    """

    @staticmethod
    def connect_to_mongodb_coll(connection_string):
        """
        Connect to a named collection in the database set in the config file.
        :param name: {str} Name of the collection to connect.
        :return: {cursor}
        """
        db_path = connection_string
        client = MongoClient(db_path)
        return client

def func(x, mFL, a, b, c):
    return mFL*scipy.special.erfc((x-a)/(b*np.sqrt(2))) + c
	
def objective(x, mFL, a, b, c):
	return (-0.63357 - func(x, mFL, a, b, c)) ** 2
	
def objective_alt(x, mFL, a, b, c):
	return (-0.67004 - func(x, mFL, a, b, c)) ** 2
	
def objective_clr(x, mFL, a, b, c):
	return (-1.07918 - func(x, mFL, a, b, c)) ** 2
	
def main(test_info):
	xdata = list(map(float, test_info[1].strip('[]').split(',')))
	ydata = list(map(float, test_info[2].strip('[]').split(',')))
	connection_string = test_info[3]
	mid = test_info[4]
	type = test_info[5]
	subtype = test_info[6]
	channel = test_info[7]
	temp = test_info[8]

	# Calculate ERFC curve fit
	popt, pcov = curve_fit(func, xdata, ydata, bounds=([-6,-13,-12,-1],[0,0,0,0]))
	estimated_y = func(xdata, *popt)

	# Calculate R2 of curve fit
	residuals = ydata - func(xdata, *popt)
	ss_res = np.sum(residuals**2)
	ss_tot = np.sum((ydata-np.mean(ydata))**2)
	rsquared = 1 - (ss_res / ss_tot)

	# Calculate CWDM4
	cwdm = minimize_scalar(objective, bracket=(min(xdata), max(xdata)), args=tuple(popt))
	cwdm_alt = minimize_scalar(objective_alt, bracket=(min(xdata), max(xdata)), args=tuple(popt))
	CLR = minimize_scalar(objective_clr, bracket=(min(xdata), max(xdata)), args=tuple(popt))
	
	# Update Server
	db = DbManager.connect_to_mongodb_coll(connection_string)
	result = db.KaiamApp.testdata.update_many(
		{"mid": mid, "type": type, "subtype": subtype, "meta.Channel": int(channel), "meta.SetTemperature_C": float(temp)},
		{"$set": {"data.R2_sens": rsquared, "data.CWDM4_sens": cwdm.x, "data.CWDM4_sens_alt1": cwdm_alt.x, "data.CLR4": CLR.x, "data.CurveFitMethod":"Extended_ERFC_Fit"}}
	)
	db.close()

	print("Python curveFit.py Completed successfully")
	return

if __name__ == '__main__':
    main(sys.argv)
